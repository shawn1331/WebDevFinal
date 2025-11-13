namespace Connect4.Logic.Policies;

public class BoardPolicy
{
    public static (int cols, int rows) ForSize(string size) => size switch { "8x7" => (8, 7), _ => (7, 6) };
}