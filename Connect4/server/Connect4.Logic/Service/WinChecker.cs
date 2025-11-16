using Connect4.Logic.Domain;
namespace Connect4.Logic.Service;

public static class WinChecker
{
    private static readonly (int rowDelta, int colDelta)[] Directions = new[] { (1, 0), (0, 1), (1, 1), (1, -1) };

    public static (bool isWin, Cell[] line) Check(int[,] board, int rows, int cols, int row0, int col0, int player)
    {
        foreach (var (directionColum, directionRow) in Directions)
        {
            var line = new List<Cell> { new Cell(row0, col0) };

            var row = row0 + directionRow;
            var col = col0 + directionColum;

            while (row >= 0 && row < rows && col >= 0 && col < cols && board[col, row] == player)
            {
                line.Add(new Cell(row, col));
                row += directionRow;
                col += directionColum;
            }

            row = row0 - directionRow;
            col = col0 - directionColum;

            while (row >= 0 && row < rows && col >= 0 && col < cols && board[col, row] == player)
            {
                line.Add(new Cell(row, col));
                row -= directionRow;
                col -= directionColum;
            }
            if (line.Count >= 4)
                return (true, line.ToArray());
        }
        return (false, Array.Empty<Cell>());
    }
}