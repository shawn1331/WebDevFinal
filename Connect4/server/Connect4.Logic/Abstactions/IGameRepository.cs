using Connect4.Logic.Domain;

namespace Connect4.Logic.Abstractions;
public interface IGameRepository
{
    Game? Get(string gameId);
    void Save(Game game);
    void Add(Game game);
}