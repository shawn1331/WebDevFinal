using Connect4.Logic.Abstractions;
using Connect4.Logic.Domain;
using Connect4.Logic.DTO;
using Connect4.Logic.Errors;
using Connect4.Logic.Policies;

namespace Connect4.Logic.Service;

public class GameService
{
    private readonly IGameRepository _repo;

    public GameService(IGameRepository repo) => _repo = repo;

    public GameView CreateGame(string gameId, string size, Player host)
    {
        var (cols, rows) = BoardPolicy.ForSize(size);
        var board = new Board(cols, rows);
        var g = new Game(gameId, board);
        g.Join(host);
        _repo.Add(g);
        return GameView.From(g);
    }

    public GameView JoinGame(string gameId, Player guest)
    {
        var g = _repo.Get(gameId) ?? throw new InvalidOperationException("Game not found.");
        g.Join(guest);
        _repo.Save(g);
        return GameView.From(g);
    }

    public GameView GetState(string gameId, string token)
    {
        var game = _repo.Get(gameId) ?? throw new InvalidOperationException("Game not found.");
        var who = EnsurePlayerToken(game, token);
        var view = GameView.From(game);
        view.Me = who;
        return view;
    }

    public GameView ApplyMove(string gameId, string token, int column)
    {
        var game = _repo.Get(gameId) ?? throw new InvalidOperationException("Game not found.");
        var who = EnsurePlayerToken(game, token);


        MovePolicy.EnsureCanMove(game, who, column);

        var row = game.Board.FindDropRow(column) ?? throw new ColumnFullException();
        game.Board.PlaceAt(row, column, who);

        var snap = game.Board.Snapshot();
        (bool isWin, Cell[] line) = WinChecker.Check(snap, game.Board.Rows, game.Board.Columns, row, column, who);
        if (isWin) game.SetWin(who, line);
        else if (game.Board.IsTopRowFilledEverywhere()) game.SetDraw();
        else game.NextTurn();

        _repo.Save(game);
        var view = GameView.From(game);
        view.Me = who;
        return view;
    }

    private static int EnsurePlayerToken(Game g, string token)
    {
        if (g.Player1?.Token == token) return 1;
        if (g.Player2?.Token == token) return 2;
        throw new InvalidMoveException("Unknown player token.");
    }
}
