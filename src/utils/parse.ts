export function parseTicket(ticketData: any) {
  const { yearOther, branchOther, year, branch, ...flattenedData } = ticketData;

  const updatedYear = yearOther ? yearOther : year;
  const updatedBranch = branchOther ? branchOther : branch;

  return {
    ...flattenedData,
    year: updatedYear,
    branch: updatedBranch,
  };
}