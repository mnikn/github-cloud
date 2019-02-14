import { Maybe } from "src/utils/maybe";

it('get nothing', () => {
  const nothing = Maybe.nothing<number>();
  expect(nothing.isNothing()).toBeTruthy();
});
