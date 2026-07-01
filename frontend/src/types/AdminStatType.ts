export interface DashboardStat {
  title: string;          
  value: string | number; 
  isPositive: boolean;    
  trendValue?: string;    

}

export interface PopularDestinationStat {
  name: string;    
  percent: number; 
  img: string;     
}

export interface RecentBookingStat {
  id: string;      
  user: string;    
  dest: string;    
  status: "Sukses" | "Menunggu" | "Gagal";
  amount: string;  
}

export interface MonitoringStatsData {
  revenueThisMonth: string; 
  totalBookings: number;    
  totalUsers: number;       
  revenueDistribution: {
    hotelPercent: number;
    transportPercent: number;
    destinationPercent: number;
  };
}

export interface GroupAnalyticsStat {
  totalGroups: number;
  activeGroups: number;
  avgMembers: number;
  favoriteDestination: string;
}