import asyncio
from routers.export import export_reports_csv

async def test_csv():
    try:
        res = await export_reports_csv()
        print(res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_csv())
