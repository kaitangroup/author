
"use client"
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from 'next/link';
import { Wallet, ArrowDownCircle, Banknote, Clock } from "lucide-react";
import WithdrawModal from "@/components/author/WithdrawModal";


export default function AuthorTransactions() {
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    lifetime: 0,
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_WP_URL;

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('wpToken');
         const res = await fetch(`${apiUrl}//wp-json/author/v1/earnings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        setBalance(data.balance);
        setTransactions(data.transactions);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard…</div>;
  }

  return (
   
    
    <div className=" space-y-6">
      {/* BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BalanceCard
          title="Available"
          amount={balance.available}
          icon={<Wallet />}
          accent="text-green-600"
        />
        <BalanceCard
          title="Pending"
          amount={balance.pending}
          icon={<Clock />}
          accent="text-yellow-600"
        />
        <BalanceCard
          title="Lifetime Earnings"
          amount={balance.lifetime}
          icon={<Banknote />}
          accent="text-blue-600"
        />
      </div>

      {/* ACTIONS */}
      <Card className="rounded-2xl shadow">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
          <div>
            <h3 className="text-lg font-semibold">Withdraw funds</h3>
            <p className="text-sm text-muted-foreground">
              Transfer available balance to your bank account
            </p>
          </div>
          <div className="flex gap-3">
          <Link href="/dashboard/author/payout-settings">
          <Button variant="outline">Payout Settings</Button>
          </Link>
            <Button disabled={balance.available <= 0} 
             onClick={() => setWithdrawOpen(true)}
              className="flex items-center gap-2">
              <ArrowDownCircle size={18} /> Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TRANSACTIONS */}
      <Card className="rounded-2xl shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 border rounded-xl"
              >
                <div>
                  <p className="font-medium">Booking #{tx.booking_id}</p>
                  <p className="text-sm text-muted-foreground">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${tx.amount}</p>
                  <Badge variant={tx.status === "paid" ? "default" : "secondary"}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <WithdrawModal 
        open={withdrawOpen} 
        onClose={() => setWithdrawOpen(false)} 
        available={balance.available}
        onSuccess={() => {
          // Refresh balance and transactions after successful withdraw
        }}  />
    </div>
 

  );
}

function BalanceCard({ title, amount, icon, accent }: any) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card className="rounded-2xl shadow">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">${amount}</p>
          </div>
          <div className={`${accent}`}>{icon}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
