import json
from typing import Any, Dict, Iterable, Optional


class DatabaseStore:
    def __init__(self, database_url: str):
        self.database_url = database_url.strip()
        self.enabled = bool(self.database_url)
        self.initialized = False

    def _connect(self):
        import psycopg
        from psycopg.rows import dict_row

        return psycopg.connect(self.database_url, autocommit=True, row_factory=dict_row)

    def initialize(
        self,
        default_users: Iterable[Dict[str, Any]],
        default_credentials: Dict[str, Dict[str, Any]],
    ) -> None:
        if not self.enabled or self.initialized:
            return

        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS soc_users (
                    user_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    role TEXT NOT NULL,
                    team TEXT NOT NULL,
                    shift TEXT NOT NULL,
                    status TEXT NOT NULL,
                    queue_level TEXT NOT NULL,
                    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
                    password_hash TEXT NOT NULL,
                    failed_attempts INTEGER NOT NULL DEFAULT 0,
                    locked_until DOUBLE PRECISION NOT NULL DEFAULT 0,
                    password_updated_at DOUBLE PRECISION NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS soc_sessions (
                    token TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES soc_users(user_id) ON DELETE CASCADE,
                    client_ip TEXT NOT NULL,
                    created_at DOUBLE PRECISION NOT NULL,
                    last_seen DOUBLE PRECISION NOT NULL,
                    expires_at DOUBLE PRECISION NOT NULL
                )
                """
            )

            existing_row = conn.execute("SELECT COUNT(*) AS count FROM soc_users").fetchone()
            if existing_row and int(existing_row["count"]) == 0:
                for user in default_users:
                    credential = default_credentials.get(str(user["user_id"]))
                    if not credential:
                        continue
                    conn.execute(
                        """
                        INSERT INTO soc_users (
                            user_id,
                            name,
                            email,
                            role,
                            team,
                            shift,
                            status,
                            queue_level,
                            permissions,
                            password_hash,
                            failed_attempts,
                            locked_until,
                            password_updated_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s)
                        """,
                        (
                            user["user_id"],
                            user["name"],
                            user["email"],
                            user["role"],
                            user["team"],
                            user["shift"],
                            user["status"],
                            user["queue_level"],
                            json.dumps(user["permissions"]),
                            credential["password_hash"],
                            0,
                            0.0,
                            credential["password_updated_at"],
                        ),
                    )

        self.initialized = True

    def _normalize_permissions(self, raw_permissions: Any):
        if isinstance(raw_permissions, str):
            return json.loads(raw_permissions)
        return list(raw_permissions or [])

    def _user_from_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        user = dict(row)
        user["permissions"] = self._normalize_permissions(user.get("permissions"))
        return user

    def list_users(self) -> list[Dict[str, Any]]:
        if not self.enabled:
            return []
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT user_id, name, email, role, team, shift, status, queue_level, permissions
                FROM soc_users
                ORDER BY created_at ASC, name ASC
                """
            ).fetchall()
        return [self._user_from_row(row) for row in rows]

    def find_user_by_identifier(self, identifier: str) -> Optional[Dict[str, Any]]:
        if not self.enabled:
            return None
        normalized = identifier.strip().lower()
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT user_id, name, email, role, team, shift, status, queue_level, permissions,
                       password_hash, failed_attempts, locked_until, password_updated_at
                FROM soc_users
                WHERE lower(user_id) = %s OR lower(name) = %s OR lower(email) = %s
                LIMIT 1
                """,
                (normalized, normalized, normalized),
            ).fetchone()
        return self._user_from_row(row) if row else None

    def update_login_failure(self, user_id: str, failed_attempts: int, locked_until: float) -> None:
        if not self.enabled:
            return
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE soc_users
                SET failed_attempts = %s, locked_until = %s
                WHERE user_id = %s
                """,
                (failed_attempts, locked_until, user_id),
            )

    def reset_login_failures(self, user_id: str) -> None:
        self.update_login_failure(user_id, 0, 0.0)

    def create_session(self, token: str, user_id: str, client_ip: str, created_at: float, expires_at: float) -> None:
        if not self.enabled:
            return
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO soc_sessions (token, user_id, client_ip, created_at, last_seen, expires_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (token, user_id, client_ip, created_at, created_at, expires_at),
            )

    def get_session_user(self, token: str) -> Optional[Dict[str, Any]]:
        if not self.enabled:
            return None
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT s.token, s.user_id AS session_user_id, s.client_ip, s.created_at, s.last_seen, s.expires_at,
                       u.user_id, u.name, u.email, u.role, u.team, u.shift, u.status, u.queue_level, u.permissions
                FROM soc_sessions s
                JOIN soc_users u ON u.user_id = s.user_id
                WHERE s.token = %s
                LIMIT 1
                """,
                (token,),
            ).fetchone()
        return self._user_from_row(row) if row else None

    def touch_session(self, token: str, last_seen: float, expires_at: float) -> None:
        if not self.enabled:
            return
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE soc_sessions
                SET last_seen = %s, expires_at = %s
                WHERE token = %s
                """,
                (last_seen, expires_at, token),
            )

    def revoke_session(self, token: str) -> None:
        if not self.enabled:
            return
        with self._connect() as conn:
            conn.execute("DELETE FROM soc_sessions WHERE token = %s", (token,))

    def revoke_expired_sessions(self, now: float) -> None:
        if not self.enabled:
            return
        with self._connect() as conn:
            conn.execute("DELETE FROM soc_sessions WHERE expires_at <= %s", (now,))

    def insert_user(self, user: Dict[str, Any], password_hash: str, password_updated_at: float) -> None:
        if not self.enabled:
            return
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO soc_users (
                    user_id,
                    name,
                    email,
                    role,
                    team,
                    shift,
                    status,
                    queue_level,
                    permissions,
                    password_hash,
                    failed_attempts,
                    locked_until,
                    password_updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s)
                """,
                (
                    user["user_id"],
                    user["name"],
                    user["email"],
                    user["role"],
                    user["team"],
                    user["shift"],
                    user["status"],
                    user["queue_level"],
                    json.dumps(user["permissions"]),
                    password_hash,
                    0,
                    0.0,
                    password_updated_at,
                ),
            )
