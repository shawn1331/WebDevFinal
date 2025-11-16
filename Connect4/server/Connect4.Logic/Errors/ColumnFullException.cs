namespace Connect4.Logic.Errors;
public class ColumnFullException : Exception
{
    public ColumnFullException() : base("The selected column is already full."){}
} 