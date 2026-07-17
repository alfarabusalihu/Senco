'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Calendar, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/api';
import { DiamondLoader } from '@/components/DiamondLoader';
import { getRoleDisplayName } from '@/lib/permissions';

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch team members client-side
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => usersService.getAllUsers(),
  });

  const filteredTeam = (teamMembers || []).filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DiamondLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-500">View and manage your team members</p>
      </div>

      {/* Team Stats */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Total Members</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{teamMembers?.length || 0}</h3>
                </div>
                <div className="hidden md:flex h-10 w-10 rounded-full bg-blue-50 items-center justify-center flex-shrink-0 ml-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Team Members</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {teamMembers?.filter(m => m.role === 'TEAM_MEMBER').length || 0}
                  </h3>
                </div>
                <div className="hidden md:flex h-10 w-10 rounded-full bg-green-50 items-center justify-center flex-shrink-0 ml-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Managers</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {teamMembers?.filter(m => m.role === 'PROJECT_MANAGER').length || 0}
                  </h3>
                </div>
                <div className="hidden md:flex h-10 w-10 rounded-full bg-orange-50 items-center justify-center flex-shrink-0 ml-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Search Results</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{filteredTeam.length}</h3>
                </div>
                <div className="hidden md:flex h-10 w-10 rounded-full bg-purple-50 items-center justify-center flex-shrink-0 ml-2">
                  <Search className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search team members by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white"
        />
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeam.map((member) => (
          <Card key={member.id} className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
                    <Badge variant={member.role === 'PROJECT_MANAGER' ? 'default' : 'outline'} className="mt-1">
                      {getRoleDisplayName(member.role)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date(member.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                <Link href={`/team/${member.id}`} className="w-full">
                  <Button variant="outline" className="w-full rounded-md" size="sm">
                    View Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeam.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No team members found matching your search.</p>
        </div>
      )}
    </div>
  );
}
