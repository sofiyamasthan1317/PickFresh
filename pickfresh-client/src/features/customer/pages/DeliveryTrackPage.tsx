import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../../providers/SocketProvider";
import { Seo } from "../../../components/Seo";
import { Card, Button } from "../../../components/ui";

export const DeliveryTrackPage = () => {
  const { id } = useParams();
  const socket = useSocket();
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (payload: any) => {
      if (!payload) return;
      // Accept either orderId or _id style identification
      if (!id || String(payload.orderId) !== String(id)) return;
      setPosition({ lat: Number(payload.lat), lng: Number(payload.lng) });
      setLastUpdated(new Date(payload.updatedAt || Date.now()).toLocaleTimeString());
    };

    socket.on("delivery-location", handler);
    return () => {
      socket.off("delivery-location", handler);
    };
  }, [socket, id]);

  const mapDotStyle = useMemo(() => ({ width: 18, height: 18, borderRadius: 9, background: "#16a34a", boxShadow: "0 6px 18px rgba(16,185,129,0.18)" }), []);

  return (
    <section className="container-px py-8">
      <Seo title={`Track order ${id}`} description="Live delivery tracking and ETA." />
      <h1 className="page-title">Live delivery tracking</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="space-y-4">
            <p className="muted-copy">Order tracking ID: <strong>{id}</strong></p>
            <div className="h-[420px] w-full rounded-2xl bg-gradient-to-br from-emerald-50 to-white/80 p-6 shadow-sm">
              {/* Simple placeholder map: dot moves within box based on lat/lng */}
              <div className="relative h-full w-full overflow-hidden rounded-xl bg-white/20">
                <div className="absolute inset-0 grid place-items-center text-sm muted-copy">Map preview (live updates)</div>
                {position ? (
                  <div style={{ position: "absolute", left: `${50 + ((position.lng % 1) - 0.5) * 80}%`, top: `${50 + ((position.lat % 1) - 0.5) * 80}%`, transform: "translate(-50%, -50%)" }}>
                    <div style={mapDotStyle} aria-hidden="true" />
                  </div>
                ) : (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm muted-copy">Waiting for partner location...</div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm muted-copy">Current position</p>
                <p className="font-mono font-semibold">{position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : "—"}</p>
                <p className="text-xs muted-copy">Last updated: {lastUpdated ?? "—"}</p>
              </div>
              <div>
                <Button variant="outline" onClick={() => {
                  if (!socket || !id) return;
                  // Ask server to emit a fresh ping for this order (optional)
                  socket.emit("request-delivery-ping", { orderId: id });
                }}>Ping partner</Button>
              </div>
            </div>
          </div>
        </Card>

        <aside>
          <Card className="p-4">
            <h3 className="font-bold">Delivery details</h3>
            <div className="mt-3 text-sm muted-copy">This view shows live updates from the assigned delivery partner. Location updates are short-lived and shown for monitoring only.</div>
          </Card>
        </aside>
      </div>
    </section>
  );
};

export default DeliveryTrackPage;
