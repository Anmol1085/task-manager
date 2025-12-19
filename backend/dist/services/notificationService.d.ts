export declare function createNotification(userId: string, type: string, payload: any, actorId?: string): Promise<any>;
export declare function getNotificationsForUser(userId: string): Promise<any>;
export declare function markNotificationRead(id: string): Promise<any>;
declare const _default: {
    createNotification: typeof createNotification;
    getNotificationsForUser: typeof getNotificationsForUser;
    markNotificationRead: typeof markNotificationRead;
};
export default _default;
//# sourceMappingURL=notificationService.d.ts.map