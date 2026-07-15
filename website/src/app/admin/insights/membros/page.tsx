"use client";

import { getRoleLabel, type UserRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fmtDate, nf, useInsights } from "../insights-context";

export default function AdminInsightsMembersPage() {
  const { data } = useInsights();

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Membros que mais usaram a IA (ordenado por perguntas feitas).
      </p>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead className="text-right">Perguntas</TableHead>
              <TableHead className="text-right">Conversas</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Última atividade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topMembers.map((m) => (
              <TableRow key={m.userId}>
                <TableCell>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={m.role === "admin" ? "primary" : "outline"}>
                    {getRoleLabel(m.role as UserRole) ?? m.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{nf.format(m.questions)}</TableCell>
                <TableCell className="text-right tabular-nums">{nf.format(m.conversations)}</TableCell>
                <TableCell className="text-right tabular-nums">{nf.format(m.tokensOut)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{fmtDate(m.lastActive)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
