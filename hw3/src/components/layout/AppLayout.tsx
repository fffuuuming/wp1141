import React from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppHeaderProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function AppHeader({ selectedTab, onTabChange }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isPlannedCoursesPage = location.pathname === '/planned-courses';
  
  const handlePlannedCoursesClick = () => {
    navigate('/planned-courses');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            台大課程網
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            您現在的位置: 課程網頁查詢 &gt; {selectedTab === 'department' ? '系所查詢首頁' : '快速查詢首頁'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            100-2修課學分數上下限規定
          </Typography>
        </Box>
        
        {/* 右上角按鈕區域 */}
        {!isPlannedCoursesPage && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePlannedCoursesClick}
              sx={{ 
                fontSize: '0.875rem',
                textTransform: 'none',
                px: 2
              }}
            >
              預計要選的課
            </Button>
          </Box>
        )}
      </Box>
      
      {!isPlannedCoursesPage && (
        <Tabs value={selectedTab} onChange={(_, newValue) => onTabChange(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="快速" value="quick" />
          <Tab label="系所" value="department" />
        </Tabs>
      )}
    </Box>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedTab = location.pathname === '/department' ? 'department' : 'quick';
  const isPlannedCoursesPage = location.pathname === '/planned-courses';
  
  const handleTabChange = (newValue: string) => {
    if (newValue === 'department') {
      navigate('/department');
    } else {
      navigate('/');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {!isPlannedCoursesPage && <AppHeader selectedTab={selectedTab} onTabChange={handleTabChange} />}
      {children}
    </Container>
  );
}
