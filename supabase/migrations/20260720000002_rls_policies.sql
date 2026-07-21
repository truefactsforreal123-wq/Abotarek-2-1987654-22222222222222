-- RestaurantTable: server-side only
ALTER TABLE "RestaurantTable" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_restaurant_tables" ON "RestaurantTable";
CREATE POLICY "admin_all_restaurant_tables" ON "RestaurantTable"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Order
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_select_orders" ON "Order";
CREATE POLICY "staff_select_orders" ON "Order"
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "staff_update_orders" ON "Order";
CREATE POLICY "staff_update_orders" ON "Order"
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- OrderItem
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_select_order_items" ON "OrderItem";
CREATE POLICY "staff_select_order_items" ON "OrderItem"
  FOR SELECT TO authenticated USING (true);

-- SystemSetting
ALTER TABLE "SystemSetting" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_system_settings" ON "SystemSetting";
CREATE POLICY "admin_all_system_settings" ON "SystemSetting"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admin: protect password hashes
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_only_admin" ON "Admin";
CREATE POLICY "admin_only_admin" ON "Admin"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Branch: public read, admin write
ALTER TABLE "Branch" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_branch" ON "Branch";
CREATE POLICY "public_read_branch" ON "Branch"
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "admin_all_branch" ON "Branch";
CREATE POLICY "admin_all_branch" ON "Branch"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Category: public read, admin write
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_category" ON "Category";
CREATE POLICY "public_read_category" ON "Category"
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "admin_all_category" ON "Category";
CREATE POLICY "admin_all_category" ON "Category"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MenuItem: public read, admin write
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_menuitem" ON "MenuItem";
CREATE POLICY "public_read_menuitem" ON "MenuItem"
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "admin_all_menuitem" ON "MenuItem";
CREATE POLICY "admin_all_menuitem" ON "MenuItem"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Review: public read approved, public insert, admin full
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_review" ON "Review";
CREATE POLICY "public_read_review" ON "Review"
  FOR SELECT TO anon USING ("approved" = true);
DROP POLICY IF EXISTS "public_insert_review" ON "Review";
CREATE POLICY "public_insert_review" ON "Review"
  FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "admin_all_review" ON "Review";
CREATE POLICY "admin_all_review" ON "Review"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SiteContent: public read, admin write
ALTER TABLE "SiteContent" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_sitecontent" ON "SiteContent";
CREATE POLICY "public_read_sitecontent" ON "SiteContent"
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "admin_all_sitecontent" ON "SiteContent";
CREATE POLICY "admin_all_sitecontent" ON "SiteContent"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
