import { getAPI } from "../api/axios-base";
import store from "@/store";

export const UserService = {
	 getAllUser() {
		getAPI
			.get("user/list-user", {
				headers: { Authorization: `Bearer ${store.state.accessToken}` }
			})
			.then(response => {
				console.log("Data loading success");
				return response
			})
			.catch(err => {
				console.log(err);
			});
	}
}
