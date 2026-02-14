USE [master]
GO
-- Create Login
CREATE LOGIN [ecommerce_user] WITH PASSWORD=N'EcomPass123!', DEFAULT_DATABASE=[ecommerce_db], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF
GO

USE [ecommerce_db]
GO
-- Create User
CREATE USER [ecommerce_user] FOR LOGIN [ecommerce_user]
GO
-- Add to roles (db_owner for simplicity during dev, or granular permissions)
ALTER ROLE [db_owner] ADD MEMBER [ecommerce_user]
GO
