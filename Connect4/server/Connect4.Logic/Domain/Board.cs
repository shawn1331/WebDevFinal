namespace Connect4.Logic.Domain;
public class Board
{
    private readonly int[,] _grid;
    private int Rows { get; }
    private int Columns { get; }

    public Board(int cols, int rows)
    {
        if (cols < 4 || rows < 4)
        {
            throw new ArgumentException("Board must be at least 4x4.");
        }
        Columns = cols;
        Rows = rows;
        _grid = new int[Rows, Columns];
    }

    public int board[int r, int c] => _grid[r, c]; // TODO: fix syntax

    public bool IsColumnFull(int col) => _grid[0, col] != 0;

    public int? FindDropRow(int col)
    {
        for (int r = Rows - 1; r >= 0; r--)
            if (_grid[r, col] == 0)
                return r;

        return null;
    }

    public void PlaceAt(int row, int col, int player) => _grid[row, col] = player;

    public int[,] Snapshot()
    {
        int[,] copy = new int[Rows, Columns];
        Array.Copy(_grid, copy, _grid.Length);
        return copy;
    }

    public bool IsTopRowFilledEverywhere()
    {
        for (int c = 0; c < Columns; c++)
            if (_grid[0, c] == 0)
                return false;

        return true;
    }
}