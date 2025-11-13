using Connect4.Logic.Domain;
using Connect4.Logic.Errors;
namespace Connect4.Logic.Policies;

public static class MovePolicy
{
    public static void EnsureCanMove(Game game, int who, int column)
    {
        if (game.Status != GameStatus.Live)
            throw new GameFinishedException();
        if (who != game.Turn)
            throw new NotYourTurnException();
        if (column < 0 || column >= game.Board.Columns)
            throw new InvalidMoveException("Column out of bounds.");
        if (game.Board.IsColumnFull(column))
            throw new ColumnFullException();
    }
}