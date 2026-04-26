CREATE TABLE `widget_data` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `widgets` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`visibility` text NOT NULL,
	`data_id` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`data_id`) REFERENCES `widget_data`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "widgets_visibility_group_id_check" CHECK((
                ("widgets"."visibility" = 'private' AND "widgets"."group_id" IS NULL) OR
                ("widgets"."visibility" = 'group' AND "widgets"."group_id" IS NOT NULL)
            ))
);
