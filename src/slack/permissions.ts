export function isResolverAuthorized(options: {
  isBtsMember: boolean;
  isThreadOpener: boolean;
}): boolean {
  return options.isBtsMember || options.isThreadOpener;
}
