namespace Connect4.Api.Models;

public sealed record CreateRoomDto(string HostName, string RoomName, string Size = "7x6", bool Ranked = false, int TimerSec = 0);
public sealed record JoinDto(string PlayerName);
public sealed record MoveDto(string Token, int Column);