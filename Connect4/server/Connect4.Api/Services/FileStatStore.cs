using System.Text.Json;
using Connect4.Api.Models;

namespace Connect4.Api.Services;

public class FileStatStore : IStatStore
{
    private readonly string _filePath;
    private readonly Dictionary<string, PlayerStats> _cache;
    private readonly object _lock = new();

    public FileStatStore(IWebHostEnvironment env)
    {
        _filePath = Path.Combine(env.ContentRootPath, "stats.json");
        _cache = Load();
    }

    private Dictionary<string, PlayerStats> Load()
    {
        if (!File.Exists(_filePath))
            return new(StringComparer.OrdinalIgnoreCase);

        try
        {
            var json = File.ReadAllText(_filePath);
            var items = JsonSerializer.Deserialize<List<PlayerStats>>(json)
                        ?? new List<PlayerStats>();
            return items.ToDictionary(x => x.Name, x => x, StringComparer.OrdinalIgnoreCase);
        }
        catch
        {
            return new(StringComparer.OrdinalIgnoreCase);
        }
    }

    private void Save()
    {
        var list = _cache.Values.OrderBy(x => x.Name).ToList();
        var json = JsonSerializer.Serialize(
            list,
            new JsonSerializerOptions { WriteIndented = true }
        );
        File.WriteAllText(_filePath, json);
    }

    public PlayerStats GetOrCreate(string name)
    {
        lock (_lock)
        {
            if (!_cache.TryGetValue(name, out var stats))
            {
                stats = new PlayerStats { Name = name };
                _cache[name] = stats;
                Save();
            }
            return stats;
        }
    }

    public PlayerStats? Get(string name)
    {
        lock (_lock)
        {
            _cache.TryGetValue(name, out var stats);
            return stats;
        }
    }

    public void RecordGame(string? player1, string? player2, int winner)
    {
        if (string.IsNullOrWhiteSpace(player1) || string.IsNullOrWhiteSpace(player2))
            return;

        lock (_lock)
        {
            var p1 = GetOrCreate(player1);
            var p2 = GetOrCreate(player2);

            p1.GamesPlayed++;
            p2.GamesPlayed++;

            if (winner == 0)
            {
                p1.Draws++;
                p2.Draws++;
            }
            else if (winner == 1)
            {
                p1.Wins++;
                p2.Losses++;
            }
            else if (winner == 2)
            {
                p2.Wins++;
                p1.Losses++;
            }

            Save();
        }
    }
}
