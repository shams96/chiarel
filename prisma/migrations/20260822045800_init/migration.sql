-- CreateTable
CREATE TABLE "Product" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "descriptor" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "ritualOrder" INTEGER,
    "family" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "complex" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "priceSub" INTEGER NOT NULL,
    "priceOneTime" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "role" TEXT,
    "badge" TEXT,
    "isSet" BOOLEAN NOT NULL DEFAULT false,
    "isIcon" BOOLEAN NOT NULL DEFAULT false,
    "actives" JSONB
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_productSlug_fkey" FOREIGN KEY ("productSlug") REFERENCES "Product" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "savings" INTEGER NOT NULL,
    "shipping" INTEGER NOT NULL,
    "total" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productSlug_fkey" FOREIGN KEY ("productSlug") REFERENCES "Product" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productSlug_key" ON "CartItem"("cartId", "productSlug");
