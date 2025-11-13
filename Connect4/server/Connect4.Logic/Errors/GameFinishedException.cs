namespace Connect4.Logic.Errors;
public class GameFinishedException : Exception
{
    public GameFinishedException() : base("The game has finished."){}
} 