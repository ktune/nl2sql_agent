-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `Manager`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
