namespace Connect4.Tests;

using Connect4.Logic.Domain;
using Connect4.Logic.Service;
using Connect4.Logic.DTO;
using Connect4.Logic.Errors;
using Connect4.Logic.Policies;
using Connect4.Logic.Abstractions;
using System.Collections.Concurrent;
public class Connect4Tests
{
    private GameService Svc()
    {
        var store = new ConcurrentDictionary<string, Game>();
        var repo = new InMemoryRepo(store);
        return new GameService(repo);
    }

    [Fact]
    public void Create_Join_Live()
    {
        var svc = Svc();
        var host = new Player("h", "Host", "T1", 1);
        var view = svc.CreateGame("G1", "7x6", host);
        Assert.Equal("Waiting", view.Status);

        var guest = new Player("g", "Guest", "T2", 2);
        var view2 = svc.JoinGame("G1", guest);
        Assert.Equal("Live", view2.Status);
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
    [Fact]
    public void TestFirstDropLandsOnBottomRow()
    {

    }

    [Fact]
    public void TestSecondDropLandsAbovePreviousDrop()
    {

    }

    [Fact]
    public void TestRejectMoveWhenColumnIsFull()
    {

    }

    [Fact]
    public void TestRejectMoveWhenNotYourTurn()
    {

    }

    [Fact]
    public void TestRejectMoveWhenGameIsFinished()
    {

    }

    [Fact]
    public void TestDetectHorizontalWin()
    {

    }

    [Fact]
    public void TestDetectVerticalWin()
    {

    }

    [Fact]
    public void TestDetectDiagonalWinRightUp()
    {

    }

    [Fact]
    public void TestDetectDiagonalWinRightDown()
    {

    }

    [Fact]
    public void TestFullBoardWithNoWinsReportsDraw()
    {

    }
    private class InMemoryRepo : IGameRepository
    {
        private readonly ConcurrentDictionary<string, Game> _store;
        public InMemoryRepo(ConcurrentDictionary<string, Game> store) => _store = store;
        public Game? Get(string id) => _store.TryGetValue(id, out var g) ? g : null;
        public void Save(Game g) => _store[g.Id] = g;
        public void Add(Game g) => _store[g.Id] = g;
    }
}
