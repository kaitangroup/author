export async function GET() {
  try {
    const res = await fetch("http://wyzant.me/wp-json");
    const data = await res.json();

    return new Response(JSON.stringify(data, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
