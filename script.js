console.log("rendering...")

var temp = 0

const recentLetters = [
  { title: 'What I should have said', recipient: 'Sarah Miller', date: '2024-12-20', status: 'Scheduled', excerpt: 'Writing down the things I wish I had said differently.' },
  { title: 'I miss you', recipient: 'Ethan Carter', date: '2024-11-02', status: 'Sent', excerpt: 'Sometimes love needs words. Sometimes words need time.' },
  { title: 'About yesterday', recipient: 'Olivia Hayes', date: '2024-10-01', status: 'Draft', excerpt: 'Taking my time to think before sending this.' },
  { title: 'Thank you note', recipient: 'Liam Foster', date: '2024-09-12', status: 'Received', excerpt: 'Gratitude that I wrote down before forgetting.' },
  { title: 'Can we talk?', recipient: 'Ava Jenkins', date: '2024-08-29', status: 'Sent', excerpt: 'Questions that need space to breathe.' },
  { title: 'Cancelled thoughts', recipient: 'Noah Reed', date: '2024-07-05', status: 'Revoked', excerpt: 'Sometimes not sending is the right answer.' }
]

const container = document.getElementById('content-container')
if (container) {
  recentLetters.forEach(function(item, idx) {
    const wrapper = document.createElement('div')
    wrapper.className = 'item cardd'

    const h3 = document.createElement('h3')
    h3.textContent = item.title

    const meta = document.createElement('p')
    meta.textContent = 'To: ' + item.recipient + '  |  Date: ' + item.date + '  |  Status: ' + item.status

    const excerpt = document.createElement('p')
    excerpt.textContent = item.excerpt

    const link = document.createElement('a')
    link.setAttribute('href', 'letter.html')
    link.textContent = (idx % 2 === 0) ? 'View' : "Read";

    wrapper.appendChild(h3)
    wrapper.appendChild(meta)
    wrapper.appendChild(excerpt)
    wrapper.appendChild(link)

    container.appendChild(wrapper)
  })
}


