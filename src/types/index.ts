export interface Order {
  id: string;
  code: string;
  name?: string;
  orderId?: string;
  email?: string;
  created: string;
  status: 'pending' | 'completed' | 'cancelled' | 'delivered' | 'processing';
  isRedeemed: boolean;
  loginInfo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface NotificationType {
  id: string;
  message: string;
  read: boolean;
  orderId: string;
  created_at: string;
}
