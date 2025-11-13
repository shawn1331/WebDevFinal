namespace Connect4.Logic.Errors;
public class InvalidMoveException : Exception
{
    public InvalidMoveException(string? message = null) : base(message ?? "Invalid move."){}
}