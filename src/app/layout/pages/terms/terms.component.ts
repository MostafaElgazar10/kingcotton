
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { PageService } from '../../../core/services/page.service';

import { Page } from '../../../core/models/page.model';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css'
})
export class TermsComponent implements OnInit {

  private pageService = inject(PageService);

  page: Page | null = null;

  loading = true;

  error = false;


  ngOnInit(): void {
    this.loadTermsPage();
  }


  loadTermsPage(): void {

    this.loading = true;
    this.error = false;

    this.pageService
      .getPageBySlug('terms')
      .subscribe({

        next: page => {

          this.page = page;

          this.loading = false;
        },

        error: error => {

          console.error(
            'TERMS PAGE API ERROR:',
            error
          );

          this.loading = false;
          this.error = true;
        }

      });
  }


  private decodeHtmlEntities(text: string): string {

    const namedEntities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' '
    };

    let result = text;

    // Named entities
    Object.keys(namedEntities).forEach(entity => {
      result = result.split(entity).join(namedEntities[entity]);
    });

    // Numeric entities, e.g. &#8217;
    result = result.replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number(code))
    );

    // Hex entities, e.g. &#x2019;
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );

    return result;

  }


  formatContent(content: string): string {

    if (!content) {
      return '';
    }

    let text = content;


    /* =========================
       Decode HTML entities
       (manual decode — no DOM, works on server & browser)
    ========================= */

    text = this.decodeHtmlEntities(text);


    /* =========================
       Normalize spaces
    ========================= */

    text = text
      .replace(/\s+/g, ' ')
      .trim();


    /* =========================
       Remove API title
       Terms & Conditions
    ========================= */

    text = text.replace(
      /^Terms\s*&\s*Conditions/i,
      ''
    ).trim();


    /* =========================
       Effective Date
    ========================= */

    const effectiveDateMatch = text.match(
      /^Effective Date:\s*\[([^\]]+)\]/i
    );

    let html = '';

    if (effectiveDateMatch) {

      html += `
        <div class="terms-date">
          <strong>Effective Date:</strong>
          [${effectiveDateMatch[1]}]
        </div>
      `;

      text = text
        .replace(effectiveDateMatch[0], '')
        .trim();
    }


    /* =========================
       Main headings
    ========================= */

    const mainSections = [

      '1. Acceptance of Terms',

      '2. Use of the Platform',

      '3. Seller and Buyer Responsibilities',

      '4. Payment and Fees',

      '5. Intellectual Property',

      '6. Termination',

      '7. Disclaimers and Limitations of Liability',

      '8. Indemnification',

      '9. Governing Law and Dispute Resolution',

      '10. Changes to These Terms',

      '11. Contact Us'

    ];


    mainSections.forEach(section => {

      text = text.replace(
        section,
        `|||MAIN|||${section}|||`
      );

    });


    const sections = text
      .split('|||MAIN|||')
      .filter(section => section.trim() !== '');


    sections.forEach(section => {

      const parts = section.split('|||');

      const heading = parts[0]?.trim();

      let body = parts
        .slice(1)
        .join('')
        .trim();


      if (!heading) {
        return;
      }


      html += `
        <section class="terms-section">

          <h2>
            ${heading}
          </h2>
      `;


      /* =========================
         Sub headings
      ========================= */

      const subHeadings = [

        'a. Eligibility',
        'b. Account Registration',
        'c. Prohibited Activities',

        'a. Sellers',
        'b. Buyers',

        'a. Payment Processing',
        'b. Fees',
        'c. Taxes',

        'a. Ownership',
        'b. User-Generated Content',
        'c. Trademarks',

        'a. Termination by You',
        'b. Termination by Us',
        'c. Effect of Termination',

        'a. Disclaimers',
        'b. Limitation of Liability',

        'a. Governing Law',
        'b. Dispute Resolution'

      ];


      subHeadings.forEach(subHeading => {

        body = body.replace(
          subHeading,
          `|||SUB|||${subHeading}|||`
        );

      });


      const subSections = body
        .split('|||SUB|||')
        .filter(item => item.trim() !== '');


      subSections.forEach(subSection => {

        const subParts = subSection.split('|||');


        if (subParts.length > 1) {

          const subHeading =
            subParts[0].trim();


          let subBody = subParts
            .slice(1)
            .join('')
            .trim();


          html += `
            <div class="terms-subsection">

              <h3>
                ${subHeading}
              </h3>
          `;


          /* =========================
             Prohibited Activities
          ========================= */

          if (
            subHeading ===
            'c. Prohibited Activities'
          ) {

            const prohibitedItems = [

              'Violating any applicable laws or regulations.',

              'Engaging in fraudulent, deceptive, or misleading practices.',

              'Infringing on the intellectual property rights of others.',

              'Distributing viruses, malware, or other harmful software.',

              'Using the platform to send unsolicited or unauthorized advertising or spam.',

              'Interfering with the proper functioning of our platform or servers.',

              'Creating multiple accounts for fraudulent purposes or to manipulate our platform.'

            ];


            let listHtml = '';


            prohibitedItems.forEach(item => {

              if (subBody.includes(item)) {

                listHtml += `
                  <li>
                    ${item}
                  </li>
                `;

                subBody = subBody.replace(
                  item,
                  ''
                );
              }

            });


            if (listHtml) {

              html += `
                <p>
                  ${subBody.trim()}
                </p>

                <ul class="terms-list">
                  ${listHtml}
                </ul>
              `;

            } else {

              html += `
                <p>
                  ${subBody}
                </p>
              `;
            }


          } else {

            /* =========================
               Item labels
            ========================= */

            const labels = [

              'Product Listings:',

              'Order Fulfillment:',

              'Returns and Refunds:',

              'Purchases:',

              'Product Reviews:',

              'Disputes:',

              'Payment Processing:',

              'Fees:',

              'Taxes:',

              'Ownership:',

              'User-Generated Content:',

              'Trademarks:'

            ];


            labels.forEach(label => {

              subBody = subBody.replace(
                label,
                `|||ITEM|||${label}|||`
              );

            });


            const items = subBody
              .split('|||ITEM|||')
              .filter(item => item.trim() !== '');


            if (items.length > 1) {

              items.forEach(item => {

                const itemParts =
                  item.split('|||');


                const label =
                  itemParts[0]?.trim();


                const description =
                  itemParts
                    .slice(1)
                    .join('')
                    .trim();


                if (label) {

                  html += `
                    <p class="terms-item">

                      <strong>
                        ${label}
                      </strong>

                      ${description}

                    </p>
                  `;
                }

              });

            } else {

              html += `
                <p>
                  ${subBody}
                </p>
              `;
            }
          }


          html += `
            </div>
          `;


        } else {

          const normalText =
            subSection.trim();


          if (normalText) {

            html += `
              <p>
                ${normalText}
              </p>
            `;
          }
        }

      });


      html += `
        </section>
      `;
    });


    return html;
  }
}