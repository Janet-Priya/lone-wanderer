
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Fragment, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ENTRIES_PER_PAGE = 8;

const Logbook = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['journal_entries', user?.id, currentPage],
    queryFn: async () => {
      if (!user) return { entries: [], count: 0 };
      const from = (currentPage - 1) * ENTRIES_PER_PAGE;
      const to = from + ENTRIES_PER_PAGE - 1;

      const { data: entries, error, count } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) {
        console.error("Error fetching logbook entries:", error);
        throw error;
      };
      return { entries: entries || [], count: count ?? 0 };
    },
    enabled: !!user,
  });

  const totalPages = Math.ceil((data?.count ?? 0) / ENTRIES_PER_PAGE);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center p-4 bg-cover bg-center font-pixel text-stone-200"
      style={{
        backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')",
      }}
    >
        <div className="w-full max-w-6xl">
            <Button asChild variant="outline" className="bg-yellow-600/80 hover:bg-yellow-700 border-yellow-800 text-stone-900 font-bold self-start mb-8">
                <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
            </Button>
        </div>

      <Card className="w-full max-w-6xl bg-stone-900/80 border-stone-700 text-stone-200">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl text-yellow-300 flex items-center justify-center gap-4">
                <BookOpen />
                Wanderer's Logbook
            </CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <p className="text-center">Loading your adventures...</p>
            ) : data?.entries && data.entries.length > 0 ? (
                <div className="border border-stone-700 rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-stone-700 hover:bg-stone-800/90">
                                <TableHead className="text-yellow-300">Date</TableHead>
                                <TableHead className="text-yellow-300">Emotion</TableHead>
                                <TableHead className="text-yellow-300">Class</TableHead>
                                <TableHead className="text-yellow-300">Quest</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.entries.map((entry) => (
                                <Collapsible asChild key={entry.id}>
                                  <Fragment>
                                    <TableRow className="border-b-0 hover:bg-stone-800/90">
                                        <TableCell>{new Date(entry.created_at || '').toLocaleDateString()}</TableCell>
                                        <TableCell>{entry.emotion}</TableCell>
                                        <TableCell>{entry.class}</TableCell>
                                        <TableCell className="max-w-sm truncate">{entry.quest}</TableCell>
                                        <TableCell>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="w-9 p-0">
                                                    <ChevronDown className="h-4 w-4" />
                                                    <span className="sr-only">Toggle</span>
                                                </Button>
                                            </CollapsibleTrigger>
                                        </TableCell>
                                    </TableRow>
                                    <CollapsibleContent asChild>
                                        <TableRow className="bg-stone-950/70">
                                            <TableCell colSpan={5} className="p-0">
                                                <div className="p-6 space-y-4 font-sans text-sm">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="font-bold text-yellow-300 text-base mb-2">Quest Details</h4>
                                                            <p><strong>Full Quest:</strong> {entry.quest}</p>
                                                            <p><strong>Realm:</strong> {entry.realm}</p>
                                                            <p><strong>Sacred Item:</strong> {entry.item} - <span className="italic text-stone-400">"{entry.item_effect}"</span></p>
                                                            <p><strong>Avatar Transformation:</strong> {entry.avatar_transformation}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sky-300 text-base mb-2">Oracle's Insight</h4>
                                                            <p><strong>Summary:</strong> {entry.insight_summary}</p>
                                                            <p><strong>Emotional Pattern:</strong> {entry.insight_emotional_pattern}</p>
                                                            <p><strong>Path to Growth:</strong> {entry.insight_growth_advice}</p>
                                                        </div>
                                                    </div>
                                                    {entry.text && (
                                                      <>
                                                        <div className="border-t border-stone-700 my-4"></div>
                                                        <h4 className="font-bold text-gray-300 text-base mb-2">Original Journal Entry</h4>
                                                        <p className="italic text-stone-400 whitespace-pre-wrap">"{entry.text}"</p>
                                                      </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </CollapsibleContent>
                                  </Fragment>
                                </Collapsible>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-center text-stone-400">Your logbook is empty. Embark on a new quest to begin your story!</p>
            )}

            {totalPages > 1 && (
                <Pagination className="mt-6 text-stone-200">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined} />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink href="#" onClick={(e) => {e.preventDefault(); setCurrentPage(i + 1)}} isActive={currentPage === i + 1}>
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Logbook;
