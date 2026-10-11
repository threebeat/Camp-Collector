CREATE TABLE challenge_offers (id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, camp TEXT NOT NULL, team TEXT NOT NULL, gold INTEGER NOT NULL, loot TEXT, state TEXT NOT NULL DEFAULT 'open', attack_receipt TEXT, created INTEGER NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX challenge_one_open ON challenge_offers(owner) WHERE state = 'open';
--> statement-breakpoint
CREATE TABLE challenge_matches (id TEXT PRIMARY KEY NOT NULL, offer_id TEXT NOT NULL, defender TEXT NOT NULL, challenger TEXT NOT NULL, defender_camp TEXT NOT NULL, challenger_camp TEXT NOT NULL, defender_team TEXT NOT NULL, challenger_team TEXT NOT NULL, seed INTEGER NOT NULL, winner TEXT NOT NULL, result TEXT NOT NULL, created INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE challenge_payouts (id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, gold INTEGER NOT NULL, items TEXT NOT NULL DEFAULT '[]', claimed INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX challenge_owner_payouts ON challenge_payouts(owner, created);
