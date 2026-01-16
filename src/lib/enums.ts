// TypeScript enums for use in code (database stores as strings)

export enum Category {
  HEALTH = "HEALTH",
  FITNESS = "FITNESS",
  LEARNING = "LEARNING",
  PRODUCTIVITY = "PRODUCTIVITY",
  RELATIONSHIPS = "RELATIONSHIPS",
  FINANCIAL = "FINANCIAL",
  CREATIVE = "CREATIVE",
  MINDFULNESS = "MINDFULNESS",
  OTHER = "OTHER",
}

export enum FrequencyType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
}

export enum CheckInStatus {
  DONE = "DONE",
  PARTIAL = "PARTIAL",
  MISSED = "MISSED",
}

export enum BadgeType {
  FIRST_CHECKIN = "FIRST_CHECKIN",
  STREAK_7_DAYS = "STREAK_7_DAYS",
  COMEBACK = "COMEBACK",
  XP_100 = "XP_100",
  STREAK_30_DAYS = "STREAK_30_DAYS",
}

