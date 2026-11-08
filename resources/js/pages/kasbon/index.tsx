import { Form, Head, router, usePage } from '@inertiajs/react';
import { Wallet } from 'lucide-react';
import KasbonController from '@/actions/App/Http/Controllers/KasbonController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Auth } from '@/types';

type KasbonRequest = {
    id: number;
    user?: { name: string };
    amount: string;
    reason: string;
    installments: number;
    status: string;
};

type PageProps = {
    auth: Auth;
    requests: KasbonRequest[];
    limit: number;
    used: number;
    remaining: number;
};

const statusColor = (status: string) => {
    if (status === 'approved') return 'default';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
};

const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
        pending: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak',
    };
    return labels[status] ?? status;
};

export default function KasbonIndex() {
    const { auth, requests, limit, used, remaining } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Kasbon" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Limit kasbon</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            Rp {limit.toLocaleString('id-ID')}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Terpakai (menunggu/disetujui)</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            Rp {used.toLocaleString('id-ID')}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Sisa</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            Rp {remaining.toLocaleString('id-ID')}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" /> Pengajuan kasbon baru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...KasbonController.store.form()}
                            options={{ preserveScroll: true }}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Jumlah (Rp)</Label>
                                        <Input
                                            type="number"
                                            name="amount"
                                            min={1}
                                            required
                                        />
                                        <p className="text-xs text-destructive">
                                            {errors.amount}
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Cicilan</Label>
                                        <Input
                                            type="number"
                                            name="installments"
                                            min={1}
                                            max={12}
                                            defaultValue={1}
                                            required
                                        />
                                        <p className="text-xs text-destructive">
                                            {errors.installments}
                                        </p>
                                    </div>
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label>Alasan</Label>
                                        <textarea
                                            name="reason"
                                            required
                                            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                        <p className="text-xs text-destructive">
                                            {errors.reason}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Button type="submit" disabled={processing}>
                                            Kirim pengajuan
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar kasbon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2">Karyawan</th>
                                        <th className="py-2">Jumlah</th>
                                        <th className="py-2">Cicilan</th>
                                        <th className="py-2">Alasan</th>
                                        <th className="py-2">Status</th>
                                        <th className="py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((r) => (
                                        <tr key={r.id} className="border-b">
                                            <td className="py-2">
                                                {r.user?.name ?? auth.user.name}
                                            </td>
                                            <td className="py-2">
                                                Rp {Number(r.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-2">{r.installments}x</td>
                                            <td className="py-2">{r.reason}</td>
                                            <td className="py-2">
                                                <Badge variant={statusColor(r.status)}>
                                                    {statusLabel(r.status)}
                                                </Badge>
                                            </td>
                                            <td className="py-2">
                                                {r.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                router.post(
                                                                    KasbonController.approve.url({
                                                                        kasbonRequest: r.id,
                                                                    }),
                                                                    {},
                                                                    { preserveScroll: true },
                                                                )
                                                            }
                                                        >
                                                            Setujui
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.post(
                                                                    KasbonController.reject.url({
                                                                        kasbonRequest: r.id,
                                                                    }),
                                                                    {},
                                                                    { preserveScroll: true },
                                                                )
                                                            }
                                                        >
                                                            Tolak
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

KasbonIndex.layout = {
    breadcrumbs: [{ title: 'Kasbon', href: '/kasbon' }],
};