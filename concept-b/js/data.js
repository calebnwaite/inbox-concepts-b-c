/* All fake data. The user is a project manager at Prairie State Builders (Lincoln, NE), a commercial GC.
   "Today" is Monday, 8:15 AM. Jeff Larsen is the Project Executive. */
(function () {
  const B = (window.B = window.B || {});

  B.DATA = {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    dayNames: { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' },
    today: 'Mon',
    /* Days that count as "before Wednesday" for the workload footnote. */
    beforeWednesday: ['Mon', 'Tue'],

    /* cat: priority | project | update. replyBy: default deadline or null. forwardTo: who a forward goes to. */
    emails: [
      {
        id: 'e1', from: 'Jeff', fullName: 'Jeff Larsen', role: 'Project Executive', cat: 'priority', time: '7:42 AM',
        subject: 'Pour schedule moved to Friday', headline: 'Jeff — pour schedule moved to Friday',
        summary: 'Jeff says the level 3 deck pour moved to Friday because of rain. He wants you to confirm the concrete crew and pump by 9.',
        body: 'Rain is coming Wednesday night, so the level 3 deck pour moves from Thursday to Friday at 6 AM. Please confirm the crew and the pump truck with Capital Concrete before 9.',
        attachments: '', replyBy: { day: 'Mon', time: '9:00 AM' }, forwardTo: 'Dave',
        cannedReply: 'Got it, Jeff. I will confirm the crew and the pump for Friday at 6 AM and send you the confirmation by nine.',
      },
      {
        id: 'e2', from: 'Corey', fullName: 'Corey Hanlon', role: 'Hanlon Lumber', cat: 'priority', time: '7:15 AM',
        subject: 'Framing package PO needs a yes by noon', headline: 'Corey — framing package needs a yes by noon',
        summary: 'Corey needs a yes on the framing package by noon, or the truck slips from Wednesday to Friday. He is short 40 studs.',
        body: 'We are short 40 studs and the plywood has not shipped. If I do not have your approval on the PO by noon, the Wednesday 6 AM truck slips to Friday.',
        attachments: '1 attachment · PO-4471.pdf', replyBy: { day: 'Mon', time: '12:00 PM' }, forwardTo: 'Aisha',
        cannedReply: 'Corey, approved. Send the framing package on the Wednesday truck and bill it to PO 4471.',
      },
      {
        id: 'e3', from: 'Marcus', fullName: 'Marcus Webb', role: 'Project Manager', cat: 'project', time: '6:58 AM', queueRank: 0,
        subject: 'Change order for unit 4B', headline: 'Marcus — change order for unit 4B',
        summary: 'Marcus sends the change order for unit 4B: plus $18,240 for the added kitchen soffit. Thomas should price it before you sign.',
        body: 'The owner added a kitchen soffit in unit 4B after the drawings were released. The change order comes to plus $18,240 and adds two days. I need your sign-off by end of day so framing can start Tuesday.',
        attachments: '1 attachment · CO-4B.pdf', replyBy: { day: 'Mon', time: '5:00 PM' }, forwardTo: 'Thomas',
        cannedReply: 'Marcus, send the 4B change order to Thomas for pricing first. I will sign it by end of day if the number holds.',
      },
      {
        id: 'e4', from: 'Dave', fullName: 'Dave Kowalski', role: 'Superintendent', cat: 'priority', time: '6:30 AM',
        subject: 'Framing inspection moved up to Wednesday', headline: 'Dave — inspection moved up to Wednesday',
        summary: 'The City of Lincoln moved the framing inspection up to Wednesday at 9. Dave needs you to confirm someone is on site.',
        body: 'The city called last night. Framing inspection on level 3 is now Wednesday at 9:00 AM instead of Thursday. Tell me by tomorrow morning who is walking it with the inspector.',
        attachments: '', replyBy: { day: 'Tue', time: '8:00 AM' }, forwardTo: 'Marcus',
        cannedReply: 'Dave, I will walk the inspection with you Wednesday at nine. Have the level 3 punch list ready.',
      },
      {
        id: 'e5', from: 'Rich', fullName: 'Rich Albrecht', role: 'Albrecht Mechanical', cat: 'project', time: 'Sun',
        subject: 'Rooftop HVAC revised bid', headline: 'Rich — revised rooftop HVAC bid',
        summary: 'Rich lowered the rooftop HVAC bid to $412,800, which is $25,700 under his first number. He wants an answer by Friday.',
        body: 'Attached is the revised bid with the alternate units. Total is $412,800. The number holds through Friday.',
        attachments: '1 attachment · HVAC-bid-rev2.pdf', replyBy: { day: 'Fri', time: '10:00 AM' }, forwardTo: 'Thomas',
        cannedReply: 'Rich, thanks for the revision. I will have an answer for you before Friday at ten.',
      },
      {
        id: 'e6', from: 'Capital Lumber', fullName: 'Capital Lumber', role: 'Supplier', cat: 'project', time: 'Sun', seedReplied: true,
        subject: 'Delivery window for next week', headline: 'Capital Lumber — delivery window',
        summary: 'Capital Lumber asked for a delivery window next week. You already replied with Tuesday morning.',
        body: 'Which morning works for the stud delivery next week? We can do Tuesday or Thursday.',
        attachments: '', replyBy: { day: 'Mon', time: '8:00 AM' }, forwardTo: 'Dave',
        cannedReply: 'Tuesday morning works. Please call the site super when the truck is thirty minutes out.',
      },
      {
        id: 'e7', from: 'Aisha', fullName: 'Aisha Rahman', role: 'Project Accountant', cat: 'update', time: 'Fri',
        subject: 'Pay application 6 is ready for review', headline: 'Aisha — pay application 6 is ready',
        summary: 'Aisha finished pay application 6. She needs your review by Thursday afternoon to submit it to the owner.',
        body: 'Pay app 6 is in the folder. Retainage is calculated and the stored materials are backed up. Please review before Thursday 2 PM.',
        attachments: '1 attachment · PayApp-06.pdf', replyBy: { day: 'Thu', time: '2:00 PM' }, forwardTo: 'Aisha',
        cannedReply: 'Aisha, I will review pay app 6 and get comments back to you Thursday before two.',
      },
      {
        id: 'e8', from: 'Capital Concrete', fullName: 'Capital Concrete', role: 'Supplier', cat: 'update', time: 'Fri',
        subject: 'Invoice 2291 — $31,880.00', headline: 'Capital Concrete — invoice 2291',
        summary: 'Capital Concrete sent invoice 2291 for $31,880. Aisha usually handles invoices.',
        body: 'Invoice 2291 for the level 2 deck pour is attached. Terms are net 30.',
        attachments: '1 attachment · Invoice-2291.pdf', replyBy: null, forwardTo: 'Aisha',
        cannedReply: 'Received, thank you. Forwarding to accounting.',
      },
      {
        id: 'e9', from: 'Procore', fullName: 'Procore', role: 'Notifications', cat: 'update', time: 'Fri',
        subject: '4 project notifications', headline: 'Procore — four notifications',
        summary: 'Four Procore notifications. Two RFIs were answered and two submittals were approved. Nothing needs you.',
        body: 'RFI 112 and RFI 118 were answered. Submittals 07 and 09 were approved.',
        attachments: '', replyBy: null, forwardTo: 'Marcus',
        cannedReply: 'Thanks, noted.',
      },
    ],

    /* Calendar items that are not tied to an email. */
    events: [
      { id: 'v1', day: 'Mon', time: '10:30 AM', title: 'Read project updates', note: '3 emails' },
      { id: 'v2', day: 'Tue', time: '7:30 AM', title: 'Safety walk with Dave', note: 'Haymarket Lofts' },
      { id: 'v3', day: 'Wed', time: '9:00 AM', title: 'Framing inspection on site', note: 'Level 3' },
      { id: 'v4', day: 'Thu', time: '10:00 AM', title: 'OAC meeting', note: 'Haymarket Lofts' },
      { id: 'v5', day: 'Fri', time: '6:00 AM', title: 'Level 3 deck pour', note: 'Capital Concrete' },
    ],

    timeOptions: ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
  };
})();
