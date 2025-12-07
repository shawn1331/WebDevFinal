using Connect4.Api.Models;

namespace Connect4.Api.Services;

public interface IStatStore
{
    PlayerStats GetOrCreate(string name);
    PlayerStats? Get(string name);
    void RecordGame(string? player1, string? player2, int winner);
    // winner: 0 = draw, 1 = player1 wins, 2 = player2 wins
}