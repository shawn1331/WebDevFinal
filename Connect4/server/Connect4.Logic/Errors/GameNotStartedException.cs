namespace Connect4.Logic.Errors;
public class GameNotStartedException : Exception
{
    public GameNotStartedException() : base("The game has not started yet."){}
}