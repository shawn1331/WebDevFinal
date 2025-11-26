namespace Connect4.Api.Models;

public class PlayerStats
{
    public string Name { get; set; } = "";
    public int GamesPlayed { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int Draws { get; set; }
}
