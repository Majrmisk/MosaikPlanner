CREATE TABLE `dashboard_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`widget_id` text NOT NULL,
	`order_index` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`widget_id`) REFERENCES `widgets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dashboard_items_user_id_widget_id_idx` ON `dashboard_items` (`user_id`,`widget_id`);