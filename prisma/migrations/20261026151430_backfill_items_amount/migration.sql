-- Eski buyurtmalarda mahsulotlar summasi = to'liq summa (yetkazish va promokod yo'q edi)
UPDATE "Order" SET "itemsAmount" = "totalAmount" WHERE "itemsAmount" = 0;
