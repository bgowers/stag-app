drop extension if exists "pg_net";


  create table "public"."challenges" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "game_id" uuid not null,
    "title" text not null,
    "description" text,
    "base_points" integer not null default 0,
    "bonus_points" integer,
    "category" text,
    "is_active" boolean not null default true,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."challenges" enable row level security;


  create table "public"."events" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "game_id" uuid not null,
    "player_id" uuid not null,
    "challenge_id" uuid not null,
    "kind" text not null,
    "points" integer not null,
    "created_by_player_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."events" enable row level security;


  create table "public"."games" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "status" text not null default 'active'::text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."games" enable row level security;


  create table "public"."players" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "game_id" uuid not null,
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."players" enable row level security;

CREATE UNIQUE INDEX challenges_pkey ON public.challenges USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX games_pkey ON public.games USING btree (id);

CREATE INDEX idx_challenges_active ON public.challenges USING btree (game_id, is_active);

CREATE INDEX idx_challenges_game_id ON public.challenges USING btree (game_id);

CREATE INDEX idx_events_challenge_id ON public.events USING btree (challenge_id);

CREATE INDEX idx_events_created_at ON public.events USING btree (created_at DESC);

CREATE INDEX idx_events_game_id ON public.events USING btree (game_id);

CREATE INDEX idx_events_player_id ON public.events USING btree (player_id);

CREATE INDEX idx_players_game_id ON public.players USING btree (game_id);

CREATE UNIQUE INDEX players_pkey ON public.players USING btree (id);

CREATE UNIQUE INDEX unique_claim_per_kind ON public.events USING btree (player_id, challenge_id, kind);

CREATE UNIQUE INDEX unique_player_per_game ON public.players USING btree (game_id, name);

alter table "public"."challenges" add constraint "challenges_pkey" PRIMARY KEY using index "challenges_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."games" add constraint "games_pkey" PRIMARY KEY using index "games_pkey";

alter table "public"."players" add constraint "players_pkey" PRIMARY KEY using index "players_pkey";

alter table "public"."challenges" add constraint "challenges_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE not valid;

alter table "public"."challenges" validate constraint "challenges_game_id_fkey";

alter table "public"."events" add constraint "events_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_challenge_id_fkey";

alter table "public"."events" add constraint "events_created_by_player_id_fkey" FOREIGN KEY (created_by_player_id) REFERENCES public.players(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_created_by_player_id_fkey";

alter table "public"."events" add constraint "events_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_game_id_fkey";

alter table "public"."events" add constraint "events_kind_check" CHECK ((kind = ANY (ARRAY['base'::text, 'bonus'::text]))) not valid;

alter table "public"."events" validate constraint "events_kind_check";

alter table "public"."events" add constraint "events_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_player_id_fkey";

alter table "public"."events" add constraint "unique_claim_per_kind" UNIQUE using index "unique_claim_per_kind";

alter table "public"."players" add constraint "players_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE not valid;

alter table "public"."players" validate constraint "players_game_id_fkey";

alter table "public"."players" add constraint "unique_player_per_game" UNIQUE using index "unique_player_per_game";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."challenges" to "anon";

grant insert on table "public"."challenges" to "anon";

grant references on table "public"."challenges" to "anon";

grant select on table "public"."challenges" to "anon";

grant trigger on table "public"."challenges" to "anon";

grant truncate on table "public"."challenges" to "anon";

grant update on table "public"."challenges" to "anon";

grant delete on table "public"."challenges" to "authenticated";

grant insert on table "public"."challenges" to "authenticated";

grant references on table "public"."challenges" to "authenticated";

grant select on table "public"."challenges" to "authenticated";

grant trigger on table "public"."challenges" to "authenticated";

grant truncate on table "public"."challenges" to "authenticated";

grant update on table "public"."challenges" to "authenticated";

grant delete on table "public"."challenges" to "service_role";

grant insert on table "public"."challenges" to "service_role";

grant references on table "public"."challenges" to "service_role";

grant select on table "public"."challenges" to "service_role";

grant trigger on table "public"."challenges" to "service_role";

grant truncate on table "public"."challenges" to "service_role";

grant update on table "public"."challenges" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."games" to "anon";

grant insert on table "public"."games" to "anon";

grant references on table "public"."games" to "anon";

grant select on table "public"."games" to "anon";

grant trigger on table "public"."games" to "anon";

grant truncate on table "public"."games" to "anon";

grant update on table "public"."games" to "anon";

grant delete on table "public"."games" to "authenticated";

grant insert on table "public"."games" to "authenticated";

grant references on table "public"."games" to "authenticated";

grant select on table "public"."games" to "authenticated";

grant trigger on table "public"."games" to "authenticated";

grant truncate on table "public"."games" to "authenticated";

grant update on table "public"."games" to "authenticated";

grant delete on table "public"."games" to "service_role";

grant insert on table "public"."games" to "service_role";

grant references on table "public"."games" to "service_role";

grant select on table "public"."games" to "service_role";

grant trigger on table "public"."games" to "service_role";

grant truncate on table "public"."games" to "service_role";

grant update on table "public"."games" to "service_role";

grant delete on table "public"."players" to "anon";

grant insert on table "public"."players" to "anon";

grant references on table "public"."players" to "anon";

grant select on table "public"."players" to "anon";

grant trigger on table "public"."players" to "anon";

grant truncate on table "public"."players" to "anon";

grant update on table "public"."players" to "anon";

grant delete on table "public"."players" to "authenticated";

grant insert on table "public"."players" to "authenticated";

grant references on table "public"."players" to "authenticated";

grant select on table "public"."players" to "authenticated";

grant trigger on table "public"."players" to "authenticated";

grant truncate on table "public"."players" to "authenticated";

grant update on table "public"."players" to "authenticated";

grant delete on table "public"."players" to "service_role";

grant insert on table "public"."players" to "service_role";

grant references on table "public"."players" to "service_role";

grant select on table "public"."players" to "service_role";

grant trigger on table "public"."players" to "service_role";

grant truncate on table "public"."players" to "service_role";

grant update on table "public"."players" to "service_role";


  create policy "Allow all on challenges"
  on "public"."challenges"
  as permissive
  for all
  to public
using (true);



  create policy "Allow all on events"
  on "public"."events"
  as permissive
  for all
  to public
using (true);



  create policy "Allow all on games"
  on "public"."games"
  as permissive
  for all
  to public
using (true);



  create policy "Allow all on players"
  on "public"."players"
  as permissive
  for all
  to public
using (true);


CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


