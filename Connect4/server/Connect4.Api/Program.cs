using System.Collections.Concurrent;
using Connect4.Api.Models;
using Connect4.Logic.Abstractions;
using Connect4.Logic.Domain;
using Connect4.Logic.DTO;
using Connect4.Logic.Errors;
using Connect4.Logic.Policies;
using Connect4.Logic.Service;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.SwaggerGen;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// In-memory data
var rooms = new ConcurrentDictionary<string, RoomView>();
var games = new ConcurrentDictionary<string, Game>();
var gameLocks = new ConcurrentDictionary<string, object>();

// In-memory repo
builder.Services.AddSingleton<IGameRepository>(sp => new InMemoryRepo(games));
builder.Services.AddSingleton<GameService>();

var app = builder.Build();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

// List rooms
app.MapGet("/api/rooms", () =>
{
    return Results.Json(rooms.Values.OrderBy(r => r.Name));
});

// Create room (and game)
app.MapPost("/api/rooms", (CreateRoomDto dto, GameService engine) =>
{
    var roomId = Guid.NewGuid().ToString("N");
    var gameId = Guid.NewGuid().ToString("N");
    var host = new Player(Guid.NewGuid().ToString("N"), dto.HostName, Guid.NewGuid().ToString("N"), 1);

    var view = engine.CreateGame(gameId, dto.Size, host);

    var rv = new RoomView(roomId, dto.RoomName, dto.Size, dto.Ranked, dto.TimerSec, true, gameId, dto.HostName);
    rooms[roomId] = rv;
    gameLocks[gameId] = new object();

    return Results.Json(new CreateRoomResult(roomId, gameId, host.Token));
});

// Join room
app.MapPost("/api/rooms/{roomId}/join", (string roomId, JoinDto dto, GameService engine) =>
{
    if (!rooms.TryGetValue(roomId, out var room)) return Results.NotFound(new { error = "Room not found." });
    if (!room.Open) return Results.BadRequest(new { error = "Room full." });

    var guest = new Player(Guid.NewGuid().ToString("N"), dto.PlayerName, Guid.NewGuid().ToString("N"), 2);
    var view = engine.JoinGame(room.GameId, guest);

    rooms[roomId] = room with { Open = false };
    return Results.Json(new JoinResult(room.GameId, guest.Token));
});

// Game state
app.MapGet("/api/games/{gameId}/state", (string gameId, string token, GameService engine) =>
{
    try { return Results.Json(engine.GetState(gameId, token)); }
    catch (Exception ex) { return Results.BadRequest(new { error = ex.Message }); }
});

// Make move (authoritative)
app.MapPost("/api/games/{gameId}/move", (string gameId, MoveDto dto, GameService engine) =>
{
    if (!gameLocks.TryGetValue(gameId, out var gate)) return Results.NotFound(new { error = "Game not found." });

    lock (gate)
    {
        try { return Results.Json(engine.ApplyMove(gameId, dto.Token, dto.Column)); }
        catch (NotYourTurnException ex) { return Results.BadRequest(new { error = ex.Message }); }
        catch (ColumnFullException ex) { return Results.BadRequest(new { error = ex.Message }); }
        catch (GameFinishedException ex) { return Results.BadRequest(new { error = ex.Message }); }
        catch (InvalidMoveException ex) { return Results.BadRequest(new { error = ex.Message }); }
        catch (GameNotStartedException ex) { return Results.BadRequest(new { error = ex.Message }); }
        catch (Exception ex) { return Results.BadRequest(new { error = ex.Message }); }

    }
});

app.Run();

// ===== In-memory repository implementation =====
 class InMemoryRepo : IGameRepository
{
    private readonly ConcurrentDictionary<string, Game> _store;
    public InMemoryRepo(ConcurrentDictionary<string, Game> store) => _store = store;

    public Game? Get(string gameId) => _store.TryGetValue(gameId, out var g) ? g : null;
    public void Save(Game game) => _store[game.Id] = game;
    public void Add(Game game) => _store[game.Id] = game;
}