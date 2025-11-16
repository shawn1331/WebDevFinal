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
        var g = _repo.Get(gameId) ?? throw new InvalidOperationException("Game not found.");
        EnsurePlayerToken(g, token);
        return GameView.From(g);
    }

    public GameView ApplyMove(string gameId, string token, int column)
    {
        var g = _repo.Get(gameId) ?? throw new InvalidOperationException("Game not found.");
        var who = EnsurePlayerToken(g, token);

        MovePolicy.EnsureCanMove(g, who, column);

        var row = g.Board.FindDropRow(column) ?? throw new ColumnFullException();
        g.Board.PlaceAt(row, column, who);

        var snap = g.Board.Snapshot();
        (bool isWin, Cell[] line) = WinChecker.Check(snap, g.Board.Rows, g.Board.Columns, row, column, who);
        if (isWin) g.SetWin(who, line);
        else if (g.Board.IsTopRowFilledEverywhere()) g.SetDraw();
        else g.NextTurn();

        _repo.Save(g);
        return GameView.From(g);
    }

    private static int EnsurePlayerToken(Game g, string token)
    {
        if (g.Player1?.Token == token) return 1;
        if (g.Player2?.Token == token) return 2;
        throw new InvalidMoveException("Unknown player token.");
    }
}
