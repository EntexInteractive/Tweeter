CREATE TABLE "profiles" (
	"guildID"	TEXT NOT NULL UNIQUE,
	"botPrefix"	TEXT NOT NULL DEFAULT '!',
	"channelID"	TEXT NOT NULL
);

CREATE TABLE "accounts" (
	"accountID"	TEXT NOT NULL,
	"accountName"	TEXT NOT NULL,
);

CREATE TABLE "following" (
	"accountID"	TEXT NOT NULL UNIQUE,
	"guildID"	TEXT NOT NULL
);