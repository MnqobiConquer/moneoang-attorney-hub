
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageSquare, Briefcase, Clock, Calendar, Upload } from 'lucide-react';
import CasesList from '@/components/portal/CasesList';
import RecentMessages from '@/components/portal/RecentMessages';
import BookConsultation from '@/components/portal/BookConsultation';
import DocumentUpload from '@/components/portal/DocumentUpload';

const PortalDashboard = () => {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: casesStats } = useQuery({
    queryKey: ['cases-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('status');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        open: data.filter(c => c.status === 'open').length,
        inProgress: data.filter(c => c.status === 'in_progress').length,
        closed: data.filter(c => c.status === 'closed').length,
        pending: data.filter(c => c.status === 'pending').length,
      };
      
      return stats;
    },
  });

  const { data: unreadMessages } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .is('read_at', null)
        .eq('is_from_lawyer', true);
      
      if (error) throw error;
      return data.length;
    },
  });

  const { data: appointmentsCount } = useQuery({
    queryKey: ['appointments-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('status', 'pending');
      
      if (error) throw error;
      return data.length;
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.first_name} {profile?.last_name}
        </h1>
        <p className="text-gray-600">Here's an overview of your legal matters</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{casesStats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(casesStats?.open || 0) + (casesStats?.inProgress || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {casesStats?.open || 0} open, {casesStats?.inProgress || 0} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consultation">Book Consultation</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CasesList />
            </div>
            <div>
              <RecentMessages />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="consultation">
          <div className="max-w-2xl">
            <BookConsultation />
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentUpload />
        </TabsContent>

        <TabsContent value="messages">
          <div className="max-w-4xl">
            <RecentMessages />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default PortalDashboard;
