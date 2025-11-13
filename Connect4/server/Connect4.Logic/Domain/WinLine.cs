namespace Connect4.Logic.Domain;

public class WinLine
{
    public IReadOnlyList<Cell> Cells { get; init; }
    public WinLine(IEnumerable<Cell> cells) => Cells = cells.ToArray();
}