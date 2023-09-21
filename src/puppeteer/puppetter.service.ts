import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PuppeteerService {
  async getPageContent(url: string): Promise<any> {
    const result: any[] = [];
    let count = 1;
    const browser: puppeteer.Browser = await puppeteer.launch({
      headless: false,
    });
    const page: puppeteer.Page = await browser.newPage();

    for (let i = 1; i <= 284; i++) {
      await page.goto(
        `https://old.ms.ro/index.php?pag=26&doc=3229&pg=${count}`,
      );

      try {
        await page.waitForSelector('body', { timeout: 10000 });

        const scrappedData = await page.evaluate(async () => {
          const drugWithDetails = [];
          const drugList = document.querySelectorAll('.informatii tr');
          drugList.forEach((drug) => {
            const drugFields = drug.querySelectorAll('td');
            if (drugFields.length !== 6) return;
            drugWithDetails.push({
              name: drugFields[2].textContent.trim(),
              producer: drugFields[3].textContent.trim(),
              importer: drugFields[4].textContent.trim(),
            });
          });
          return drugWithDetails;
        });
        result.push(...scrappedData);
        count++;
      } catch (error) {
        console.error('Text not found on the page:', error);
      }
    }

    await browser.close();
    const filename = 'suplimente';
    this.saveArrayToExcel(result, filename);
    return result;
  }

  async saveArrayToExcel(data: any[], filename: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Add data rows
    data.forEach((item) => {
      const row = [];
      headers.forEach((header) => {
        row.push(item[header]);
      });
      worksheet.addRow(row);
    });

    // Save the Excel file
    const filePath = `./${filename}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    // Return the file path
    return filePath;
  }

  // async getPageContent(url: string): Promise<string> {
  //   let result: string;
  //   const browser: puppeteer.Browser = await puppeteer.launch({
  //     headless: true,
  //   });
  //   const page: puppeteer.Page = await browser.newPage();
  //
  //   await page.goto(url);
  //
  //   try {
  //     await page.waitForSelector('body', { timeout: 10000 });
  //
  //     result = await page.evaluate(() => {
  //       return document.body.innerText;
  //     });
  //   } catch (error) {
  //     console.error('Text not found on the page:', error);
  //   }
  //
  //   await browser.close();
  //   return result;
  // }
}
