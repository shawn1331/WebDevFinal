namespace Connect4.Api.Models;

public sealed record CreateRoomResult(string RoomId, string GameId, string HostToken);
public sealed record JoinResult(string GameId, string GuestToken);
public sealed record RoomView(string Id, string Name, string Size, bool Ranked, int TimerSec, bool Open, string GameId, string HostName);
