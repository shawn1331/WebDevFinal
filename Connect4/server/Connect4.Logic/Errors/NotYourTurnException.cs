namespace Coneect4.Logic.Errors;
public class NotYourTurnException : Exception
{
    public NotYourTurnException() : base("It's not your turn."){}
}