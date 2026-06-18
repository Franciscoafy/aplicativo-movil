import asyncio
import asyncpg

QUERY = "SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'telemetry_test'"

async def check():
    for db in ["iotdb", "postgres"]:
        try:
            conn = await asyncpg.connect(
                host="192.168.50.232",
                port=5432,
                user="postgres",
                password="postgres",
                database=db
            )
            rows = await conn.fetch(QUERY)
            if rows:
                print(f"[OK] Base de datos '{db}' -> tabla encontrada en schema: {rows[0]['table_schema']}")
            else:
                print(f"[NO] Base de datos '{db}' -> tabla NO encontrada")
            await conn.close()
        except Exception as e:
            print(f"[ERR] Base de datos '{db}' -> {e}")

asyncio.run(check())
