namespace Connect4.Api.Models;

public record CreateRoomResult(string RoomId, string GameId, string HostToken);
public record JoinResult(string GameId, string GuestToken);
public record RoomView(string Id, string Name, string Size, bool Ranked, int TimerSec, bool Open, string GameId, string HostName);
